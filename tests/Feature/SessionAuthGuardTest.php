<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\AuthTokenService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SessionAuthGuardTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_stays_on_admin_dashboard_with_token_on_refresh(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'email' => 'admin.test@besmindo.com',
        ]);

        $token = AuthTokenService::generateToken($admin);

        // Simulasi F5 (Refresh) dengan cookie tab token
        $response = $this->withUnencryptedCookie(AuthTokenService::COOKIE_TAB_TOKEN, $token)
            ->get(route('admin.dashboard'));

        $response->assertStatus(200);
        $this->assertEquals($admin->id, auth()->id());
    }

    public function test_user_stays_on_user_input_data_with_token_on_refresh(): void
    {
        $user = User::factory()->create([
            'role' => 'user',
            'email' => 'user.test@besmindo.com',
            'assigned_rigs' => ['BMS # 19'],
        ]);

        $token = AuthTokenService::generateToken($user);

        // Simulasi F5 (Refresh) dengan cookie tab token
        $response = $this->withUnencryptedCookie(AuthTokenService::COOKIE_TAB_TOKEN, $token)
            ->get(route('user.input-data'));

        $response->assertStatus(200);
        $this->assertEquals($user->id, auth()->id());
    }

    public function test_admin_path_restores_admin_when_user_session_overwritten_by_another_tab(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'email' => 'admin.guard@besmindo.com',
        ]);

        $pic = User::factory()->create([
            'role' => 'user',
            'email' => 'pic.guard@besmindo.com',
            'assigned_rigs' => ['BMS # 19'],
        ]);

        $adminToken = AuthTokenService::generateToken($admin);

        // Simulasi kondisi tab lain barusan login sebagai PIC (Auth::user() = PIC)
        $this->actingAs($pic);

        // Tab admin di-refresh di /admin/dashboard dengan membawa cookie atau header admin
        $response = $this->withUnencryptedCookie(AuthTokenService::COOKIE_ADMIN_AUTH, $adminToken)
            ->get(route('admin.dashboard'));

        // Tidak boleh dilempar ke /user/input-data (No Path Crossing)
        $response->assertStatus(200);
        $this->assertEquals($admin->id, auth()->id());
    }

    public function test_multi_tab_header_isolation_returns_correct_user_identity(): void
    {
        $ahmad = User::factory()->create([
            'name' => 'Ahmad Afandi',
            'email' => 'ahmad.test@besmindo.com',
            'role' => 'user',
            'assigned_rigs' => ['BMS # 19'],
        ]);

        $edos = User::factory()->create([
            'name' => 'Edo Syahputra',
            'email' => 'edos.test@besmindo.com',
            'role' => 'user',
            'assigned_rigs' => ['BMS # 19'],
        ]);

        $ahmadToken = AuthTokenService::generateToken($ahmad);
        $edosToken = AuthTokenService::generateToken($edos);

        // Tab Ahmad meminta data current user dengan header tab Ahmad
        $responseAhmad = $this->withHeaders([
            AuthTokenService::HEADER_TAB_TOKEN => $ahmadToken,
        ])->getJson(route('auth.current-user'));

        $responseAhmad->assertStatus(200)
            ->assertJson([
                'authenticated' => true,
                'user' => [
                    'id' => $ahmad->id,
                    'email' => 'ahmad.test@besmindo.com',
                ],
            ]);

        // Tab Edos meminta data current user dengan header tab Edos
        $responseEdos = $this->withHeaders([
            AuthTokenService::HEADER_TAB_TOKEN => $edosToken,
        ])->getJson(route('auth.current-user'));

        $responseEdos->assertStatus(200)
            ->assertJson([
                'authenticated' => true,
                'user' => [
                    'id' => $edos->id,
                    'email' => 'edos.test@besmindo.com',
                ],
            ]);
    }

    public function test_unauthenticated_request_without_token_redirects_to_login(): void
    {
        $response = $this->get(route('admin.dashboard'));
        $response->assertRedirect(route('login'));
    }
}
