<?php

namespace App\Services;

use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;

class AuthTokenService
{
    public const COOKIE_TAB_TOKEN = 'besmindo_tab_token';

    public const COOKIE_ADMIN_AUTH = 'besmindo_admin_auth';

    public const COOKIE_USER_AUTH = 'besmindo_user_auth';

    public const HEADER_TAB_TOKEN = 'X-Besmindo-Tab-Token';

    /**
     * Menghasilkan token terenkripsi anti-tamper untuk user & tab tertentu.
     */
    public static function generateToken(User $user, ?string $tabId = null): string
    {
        $payload = [
            'sub' => $user->id,
            'email' => $user->email,
            'role' => $user->role,
            'tab_id' => $tabId ?: Str::random(16),
            'iat' => now()->timestamp,
            'exp' => now()->addDays(14)->timestamp,
        ];

        return Crypt::encryptString(json_encode($payload));
    }

    /**
     * Memvalidasi token dan mengembalikan instance User jika valid dan belum kadaluarsa.
     */
    public static function validateToken(?string $token): ?User
    {
        if (empty($token) || ! is_string($token)) {
            return null;
        }

        try {
            $decrypted = Crypt::decryptString($token);
            $payload = json_decode($decrypted, true);

            if (! is_array($payload) || empty($payload['sub']) || empty($payload['exp'])) {
                return null;
            }

            // Periksa masa berlaku token
            if (now()->timestamp > $payload['exp']) {
                return null;
            }

            /** @var User|null $user */
            $user = User::find($payload['sub']);

            if (! $user || strtolower($user->email) !== strtolower($payload['email'] ?? '')) {
                return null;
            }

            // Pastikan akun aktif jika ada kolom status
            if (! empty($user->status) && strtolower((string) $user->status) !== 'active') {
                return null;
            }

            return $user;
        } catch (Exception $e) {
            return null;
        }
    }

    /**
     * Mengekstrak dan memvalidasi User dari request berdasarkan token & peran prioritas (Role).
     */
    public static function resolveUserFromRequest(Request $request, ?string $preferredRole = null): ?User
    {
        // 1. Periksa token spesifik tab dari header atau query
        $tabToken = $request->header(self::HEADER_TAB_TOKEN)
            ?? $request->input('_tab_token')
            ?? $request->cookie(self::COOKIE_TAB_TOKEN);

        if ($tabToken) {
            $user = self::validateToken($tabToken);
            if ($user) {
                // Jika tidak ada preferredRole, atau role user sesuai, gunakan user ini
                if (! $preferredRole || $user->role === $preferredRole) {
                    return $user;
                }
            }
        }

        // 2. Jika path mengharuskan role ADMIN (/admin/*), periksa token admin tersimpan
        if ($preferredRole === 'admin') {
            $adminCookie = $request->cookie(self::COOKIE_ADMIN_AUTH);
            if ($adminCookie) {
                $user = self::validateToken($adminCookie);
                if ($user && $user->role === 'admin') {
                    return $user;
                }
            }
        }

        // 3. Jika path mengharuskan role USER (/user/*), periksa token user tersimpan
        if ($preferredRole === 'user') {
            $userCookie = $request->cookie(self::COOKIE_USER_AUTH);
            if ($userCookie) {
                $user = self::validateToken($userCookie);
                if ($user && $user->role === 'user') {
                    return $user;
                }
            }
        }

        // 4. Fallback ke token tab umum jika ada
        if ($tabToken) {
            $user = self::validateToken($tabToken);
            if ($user) {
                return $user;
            }
        }

        // 5. Fallback ke cookie role mana pun yang tersedia
        $adminCookie = $request->cookie(self::COOKIE_ADMIN_AUTH);
        if ($adminCookie) {
            $user = self::validateToken($adminCookie);
            if ($user) {
                return $user;
            }
        }

        $userCookie = $request->cookie(self::COOKIE_USER_AUTH);
        if ($userCookie) {
            $user = self::validateToken($userCookie);
            if ($user) {
                return $user;
            }
        }

        return null;
    }
}
