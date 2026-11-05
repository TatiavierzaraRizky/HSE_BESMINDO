<?php

namespace App\Http\Middleware;

use App\Services\AuthTokenService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request with token validation and role persistence guard.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $targetRole = in_array('admin', $roles) && ! in_array('user', $roles)
            ? 'admin'
            : (in_array('user', $roles) && ! in_array('admin', $roles) ? 'user' : null);

        // Jika belum terautentikasi di session Laravel, cek apakah ada token valid di request/cookie
        if (! Auth::check()) {
            $tokenUser = AuthTokenService::resolveUserFromRequest($request, $targetRole);
            if ($tokenUser) {
                Auth::setUser($tokenUser);
                if ($request->hasSession()) {
                    $request->session()->put(Auth::getName(), $tokenUser->getAuthIdentifier());
                }
            }
        }

        // Jika tetap belum terotentikasi setelah pengecekan token, baru redirect ke login
        if (! Auth::check()) {
            return redirect()->route('login')->withErrors([
                'email' => 'Sesi Anda belum aktif atau telah berakhir. Harap login terlebih dahulu.',
            ]);
        }

        $user = Auth::user();

        // Jika role saat ini tidak cocok (misal tab lain barusan login dengan role berbeda),
        // lakukan pemulihan otomatis sesuai target role halaman yang sedang dibuka
        if (! empty($roles) && ! in_array($user->role, $roles)) {
            $tokenUser = AuthTokenService::resolveUserFromRequest($request, $targetRole);
            if ($tokenUser && in_array($tokenUser->role, $roles)) {
                Auth::setUser($tokenUser);
                if ($request->hasSession()) {
                    $request->session()->put(Auth::getName(), $tokenUser->getAuthIdentifier());
                }
                $user = $tokenUser;
            }
        }

        // Jika setelah pemulihan token hak akses tetap tidak memenuhi
        if (! empty($roles) && ! in_array($user->role, $roles)) {
            // User lapangan mencoba membuka area admin
            if ($user->role === 'user') {
                return redirect()->route('user.input-data')->with('error', 'Akses ditolak: Akun Anda tidak memiliki hak akses Administrator.');
            }

            // Admin membuka area khusus role lain
            return redirect()->route('admin.dashboard');
        }

        return $next($request);
    }
}
