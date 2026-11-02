<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $defaultPassword = Hash::make('password');

        $users = [
            // 1. Admin
            [
                'email' => 'admin@besmindo.com',
                'name' => 'HSE Administrator',
                'role' => 'admin',
                'area' => null,
                'status' => 'Active',
                'password' => $defaultPassword,
            ],

            // 2. Akun Area HSE Coord
            [
                'email' => 'hse.rh1@besmindo.com',
                'name' => 'HSE Coord RH-1',
                'role' => 'user',
                'area' => 'RH-1',
                'status' => 'Active',
                'password' => $defaultPassword,
            ],
            [
                'email' => 'hse.ho@besmindo.com',
                'name' => 'HSE Coord HO',
                'role' => 'user',
                'area' => 'HO',
                'status' => 'Active',
                'password' => $defaultPassword,
            ],
            [
                'email' => 'hse.south@besmindo.com',
                'name' => 'HSE Coord South',
                'role' => 'user',
                'area' => 'South',
                'status' => 'Active',
                'password' => $defaultPassword,
            ],
            [
                'email' => 'hse.north@besmindo.com',
                'name' => 'HSE Coord North',
                'role' => 'user',
                'area' => 'North',
                'status' => 'Active',
                'password' => $defaultPassword,
            ],

            // 3. Akun Personal PIC HSE Coord (Sesuai Matriks Excel)
            // Area RH-1
            [
                'email' => 'ahmad.afandi@besmindo.com',
                'name' => 'Ahmad Afandi',
                'role' => 'user',
                'area' => 'RH-1',
                'status' => 'Active',
                'password' => $defaultPassword,
            ],
            [
                'email' => 'edo.syahputra@besmindo.com',
                'name' => 'Edo Syahputra',
                'role' => 'user',
                'area' => 'RH-1',
                'status' => 'Active',
                'password' => $defaultPassword,
            ],

            // Area HO
            [
                'email' => 'mulya.fernando@besmindo.com',
                'name' => 'Mulya Fernando',
                'role' => 'user',
                'area' => 'HO',
                'status' => 'Active',
                'password' => $defaultPassword,
            ],
            [
                'email' => 'joko.nuryanto@besmindo.com',
                'name' => 'Joko Nuryanto',
                'role' => 'user',
                'area' => 'HO',
                'status' => 'Active',
                'password' => $defaultPassword,
            ],

            // Area North
            [
                'email' => 'suryatno@besmindo.com',
                'name' => 'Suryatno',
                'role' => 'user',
                'area' => 'North',
                'status' => 'Active',
                'password' => $defaultPassword,
            ],
            [
                'email' => 'satrio@besmindo.com',
                'name' => 'Satrio',
                'role' => 'user',
                'area' => 'North',
                'status' => 'Active',
                'password' => $defaultPassword,
            ],

            // Area South
            [
                'email' => 'teddy@besmindo.com',
                'name' => 'Teddy',
                'role' => 'user',
                'area' => 'South',
                'status' => 'Active',
                'password' => $defaultPassword,
            ],
            [
                'email' => 'jejen@besmindo.com',
                'name' => 'Jejen',
                'role' => 'user',
                'area' => 'South',
                'status' => 'Active',
                'password' => $defaultPassword,
            ],

            // 4. Akun Demo Umum
            [
                'email' => 'user@besmindo.com',
                'name' => 'Field PIC (General)',
                'role' => 'user',
                'area' => 'South',
                'status' => 'Active',
                'password' => $defaultPassword,
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }
    }
}
