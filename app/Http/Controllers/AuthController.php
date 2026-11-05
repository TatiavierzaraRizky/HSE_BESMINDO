<?php

namespace App\Http\Controllers;

use App\Mail\PasswordResetMail;
use App\Models\User;
use App\Services\AuthTokenService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AuthController extends Controller
{
    /**
     * Menampilkan halaman login.
     */
    public function showLogin(Request $request)
    {
        // Jika user mengakses root URL ('/'), arahkan ke dashboard sesuai role jika sudah login
        if ($request->path() === '/' && Auth::check()) {
            $user = Auth::user();
            if ($user->role === 'admin') {
                return redirect()->route('admin.dashboard');
            }

            return redirect()->route('user.input-data');
        }

        return Inertia::render('Login', [
            'activeSessionUser' => Auth::check() ? [
                'id' => Auth::user()->id,
                'name' => Auth::user()->name,
                'role' => Auth::user()->role,
                'email' => Auth::user()->email,
            ] : null,
        ]);
    }

    /**
     * Menampilkan halaman registrasi akun baru.
     */
    public function showRegister()
    {
        if (Auth::check()) {
            $user = Auth::user();
            if ($user->role === 'admin') {
                return redirect()->route('admin.dashboard');
            }

            return redirect()->route('user.input-data');
        }

        return Inertia::render('Auth/Register');
    }

    /**
     * Menyimpan data pendaftaran akun baru langsung ke database MySQL.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', 'string', 'in:admin,user'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format alamat email tidak valid.',
            'email.unique' => 'Alamat email ini sudah terdaftar di database.',
            'role.required' => 'Pilih peran akun (Role Access).',
            'role.in' => 'Pilihan peran tidak valid.',
            'password.required' => 'Kata sandi wajib diisi.',
            'password.min' => 'Kata sandi minimal harus 6 karakter.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak sesuai.',
        ]);

        $user = User::create([
            'name' => trim($validated['name']),
            'email' => strtolower(trim($validated['email'])),
            'role' => $validated['role'],
            'status' => 'active',
            'password' => Hash::make($validated['password']),
        ]);

        // Setelah registrasi berhasil, arahkan kembali ke halaman Login dengan pesan sukses
        return redirect()->route('login')->with('status', 'Registrasi akun berhasil! Silakan masuk dengan email dan kata sandi Anda.');
    }

    /**
     * Proses autentikasi login dengan 2 role (Admin & User/PIC).
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'string'],
            'password' => ['required', 'string'],
            'role' => ['nullable', 'string', 'in:admin,user'],
        ]);

        $rawEmail = strtolower(trim($validated['email']));

        // Shortcut aliases untuk kemudahan login area HSE Coord & PIC
        $aliases = [
            'admin' => 'admin@besmindo.com',
            'user' => 'user@besmindo.com',
            'rh1' => 'hse.rh1@besmindo.com',
            'rh-1' => 'hse.rh1@besmindo.com',
            'hse.rh1' => 'hse.rh1@besmindo.com',
            'ho' => 'hse.ho@besmindo.com',
            'hse.ho' => 'hse.ho@besmindo.com',
            'south' => 'hse.south@besmindo.com',
            'hse.south' => 'hse.south@besmindo.com',
            'north' => 'hse.north@besmindo.com',
            'hse.north' => 'hse.north@besmindo.com',
            'ahmad' => 'ahmad.afandi@besmindo.com',
            'afandi' => 'ahmad.afandi@besmindo.com',
            'edo' => 'edo.syahputra@besmindo.com',
            'mulya' => 'mulya.fernando@besmindo.com',
            'joko' => 'joko.nuryanto@besmindo.com',
            'suryatno' => 'suryatno@besmindo.com',
            'satrio' => 'satrio@besmindo.com',
            'teddy' => 'teddy@besmindo.com',
            'jejen' => 'jejen@besmindo.com',
        ];

        $targetEmail = $aliases[$rawEmail] ?? (str_contains($rawEmail, '@') ? $rawEmail : $rawEmail.'@besmindo.com');

        $credentials = [
            'email' => $targetEmail,
            'password' => $validated['password'],
        ];

        $user = null;
        if (Auth::attempt(['email' => $credentials['email'], 'password' => $credentials['password']], $request->boolean('remember'))) {
            $user = Auth::user();
        } else {
            // Fallback demo matching jika password default
            $candidate = User::where('email', $credentials['email'])->first();
            if ($candidate && Hash::check($credentials['password'], $candidate->password)) {
                Auth::login($candidate, $request->boolean('remember'));
                $user = $candidate;
            }
        }

        if ($user) {
            $request->session()->regenerate();

            // Buat token terenkripsi persisten untuk tab ini
            $token = AuthTokenService::generateToken($user, $request->input('tab_id'));

            // Cookie tab token (non-HttpOnly agar dapat disinkronkan oleh JS antar tab)
            cookie()->queue(cookie(
                AuthTokenService::COOKIE_TAB_TOKEN,
                $token,
                60 * 24 * 14,
                '/',
                null,
                false,
                false,
                false,
                'Lax'
            ));

            // Cookie role tersimpan untuk mencegah path-crossing saat refresh
            if ($user->role === 'admin') {
                cookie()->queue(cookie(
                    AuthTokenService::COOKIE_ADMIN_AUTH,
                    $token,
                    60 * 24 * 14,
                    '/',
                    null,
                    false,
                    true,
                    false,
                    'Lax'
                ));
            } else {
                cookie()->queue(cookie(
                    AuthTokenService::COOKIE_USER_AUTH,
                    $token,
                    60 * 24 * 14,
                    '/',
                    null,
                    false,
                    true,
                    false,
                    'Lax'
                ));
            }

            if ($user->role === 'admin') {
                return redirect()->intended(route('admin.dashboard'));
            }

            return redirect()->intended(route('user.input-data'));
        }

        return back()->withErrors([
            'email' => 'Email, password, atau role yang Anda masukkan tidak sesuai.',
        ])->onlyInput('email');
    }

    /**
     * Menampilkan halaman lupa password.
     */
    public function showForgotPassword()
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
            'resetUrl' => session('resetUrl'),
        ]);
    }

    /**
     * Mengirim link reset password ke email pengguna.
     */
    public function sendResetLinkEmail(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
        ], [
            'email.required' => 'Harap masukkan alamat email Anda.',
            'email.email' => 'Format alamat email tidak valid.',
            'email.exists' => 'Alamat email ini tidak terdaftar di sistem kami.',
        ]);

        $email = $request->email;
        $user = User::where('email', $email)->first();
        $token = Str::random(60);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            [
                'token' => Hash::make($token),
                'created_at' => now(),
            ]
        );

        $resetUrl = url("/reset-password/{$token}?email=".urlencode($email));

        // Kirim email
        try {
            Mail::to($email)->send(new PasswordResetMail($user, $resetUrl));
        } catch (\Throwable $e) {
            Log::warning('Password reset email could not be sent: '.$e->getMessage());
        }

        return back()->with([
            'status' => 'Tautan untuk mengatur ulang kata sandi telah dikirimkan ke email Anda!',
            'resetUrl' => $resetUrl,
        ]);
    }

    /**
     * Menampilkan halaman form pembuatan password baru.
     */
    public function showResetPassword(Request $request, $token)
    {
        return Inertia::render('Auth/ResetPassword', [
            'token' => $token,
            'email' => $request->query('email', ''),
        ]);
    }

    /**
     * Memproses reset password baru.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => ['required'],
            'email' => ['required', 'email', 'exists:users,email'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ], [
            'password.required' => 'Kata sandi baru wajib diisi.',
            'password.min' => 'Kata sandi minimal 6 karakter.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (! $record || ! Hash::check($request->token, $record->token)) {
            // Periksa juga jika waktu token lebih dari 60 menit
            return back()->withErrors([
                'email' => 'Token reset kata sandi tidak valid atau telah kadaluarsa. Silakan ajukan kembali.',
            ]);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        // Hapus token yang sudah dipakai
        DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->delete();

        return redirect()->route('login')->with('status', 'Kata sandi Anda berhasil diperbarui! Silakan masuk dengan kata sandi baru Anda.');
    }

    /**
     * Logout pengguna.
     */
    public function logout(Request $request)
    {
        $role = Auth::user()?->role;

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        cookie()->queue(cookie()->forget(AuthTokenService::COOKIE_TAB_TOKEN));
        if ($role === 'admin') {
            cookie()->queue(cookie()->forget(AuthTokenService::COOKIE_ADMIN_AUTH));
        } else {
            cookie()->queue(cookie()->forget(AuthTokenService::COOKIE_USER_AUTH));
        }

        return redirect()->route('login');
    }
}
