<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'role', 'area', 'assigned_rigs', 'status', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    public const AREA_RIG_MAP = [
        'RH-1' => ['BMS # 19', 'BMS # 16', 'BMS # 11', 'BMS # 10'],
        'HO' => ['BMS # 20', 'BMS # 15', 'BMS # 14', 'BMS # 07', 'BMS # 06'],
        'North' => ['BMS # 05', 'BMS # 18'],
        'South' => ['BMS # 12', 'BMS # 09', 'BMS # 08', 'BMS # 03', 'BMS # 01'],
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'assigned_rigs' => 'array',
        ];
    }

    /**
     * Ambil daftar Rig yang menjadi hak akses pengguna.
     *
     * @return array<string>
     */
    public function getAssignedRigs(): array
    {
        if ($this->role === 'admin') {
            return [
                'BMS # 19', 'BMS # 16', 'BMS # 11', 'BMS # 10',
                'BMS # 20', 'BMS # 15', 'BMS # 14', 'BMS # 07', 'BMS # 06',
                'BMS # 05', 'BMS # 18',
                'BMS # 12', 'BMS # 09', 'BMS # 08', 'BMS # 03', 'BMS # 01',
            ];
        }

        if (! empty($this->assigned_rigs) && is_array($this->assigned_rigs)) {
            return $this->assigned_rigs;
        }

        if (! empty($this->area) && isset(self::AREA_RIG_MAP[$this->area])) {
            return self::AREA_RIG_MAP[$this->area];
        }

        // Deteksi fallback berdasarkan nama atau email PIC
        $lower = strtolower($this->name.' '.$this->email);
        if (str_contains($lower, 'afandi') || str_contains($lower, 'edo') || str_contains($lower, 'rh1') || str_contains($lower, 'rh-1')) {
            return self::AREA_RIG_MAP['RH-1'];
        }
        if (str_contains($lower, 'mulya') || str_contains($lower, 'joko') || str_contains($lower, 'ho')) {
            return self::AREA_RIG_MAP['HO'];
        }
        if (str_contains($lower, 'suryatno') || str_contains($lower, 'satrio') || str_contains($lower, 'north')) {
            return self::AREA_RIG_MAP['North'];
        }
        if (str_contains($lower, 'teddy') || str_contains($lower, 'jejen') || str_contains($lower, 'south')) {
            return self::AREA_RIG_MAP['South'];
        }

        return [];
    }

    /**
     * Cek apakah pengguna berhak mengakses rig tertentu.
     */
    public function canAccessRig(?string $rigNo): bool
    {
        if ($this->role === 'admin' || empty($rigNo)) {
            return true;
        }

        return in_array($rigNo, $this->getAssignedRigs(), true);
    }
}
