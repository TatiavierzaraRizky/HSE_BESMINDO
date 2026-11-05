<?php

namespace App\Http\Middleware;

use App\Services\AuthTokenService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class TabAuthMiddleware
{
    /**
     * Memastikan request diotentikasi berdasarkan isolasi tab dan token persisten.
     * Mencegah session overwrite saat multi-tab dan mencegah random logout saat F5.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $preferredRole = null;
        if ($request->is('admin') || $request->is('admin/*')) {
            $preferredRole = 'admin';
        } elseif ($request->is('user') || $request->is('user/*')) {
            $preferredRole = 'user';
        }

        // Cek apakah ada token valid pada request (Tab Header / Cookie / Role Cookie)
        $tokenUser = AuthTokenService::resolveUserFromRequest($request, $preferredRole);

        if ($tokenUser) {
            $currentUser = Auth::user();

            // Lakukan sinkronisasi jika belum login, atau jika role saat ini berbeda dengan role yang dibutuhkan
            $needSwitch = ! $currentUser
                || $currentUser->id !== $tokenUser->id
                || ($preferredRole && $currentUser->role !== $preferredRole && $tokenUser->role === $preferredRole);

            if ($needSwitch) {
                Auth::setUser($tokenUser);

                if ($request->hasSession()) {
                    $request->session()->put(Auth::getName(), $tokenUser->getAuthIdentifier());
                }
            }
        }

        $response = $next($request);

        // Jika user aktif, pastikan cookie tab token terhubung pada response
        if (Auth::check()) {
            $activeUser = Auth::user();
            $existingTabToken = $request->cookie(AuthTokenService::COOKIE_TAB_TOKEN);
            $tokenValid = $existingTabToken && AuthTokenService::validateToken($existingTabToken)?->id === $activeUser->id;

            if (! $tokenValid) {
                $newToken = AuthTokenService::generateToken($activeUser);
                $cookie = cookie(
                    AuthTokenService::COOKIE_TAB_TOKEN,
                    $newToken,
                    60 * 24 * 14,
                    '/',
                    null,
                    false,
                    false, // non-HttpOnly agar dapat disinkronkan oleh JS saat tab switch
                    false,
                    'Lax'
                );
                $response->headers->setCookie($cookie);
            }
        }

        return $response;
    }
}
