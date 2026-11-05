<?php

use App\Models\User;
use App\Services\AuthTokenService;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\Crypt;

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

$user = User::first();
$token = AuthTokenService::generateToken($user);

try {
    $decrypted = Crypt::decryptString($token);
    echo 'Decrypted: '.$decrypted."\n";
    $payload = json_decode($decrypted, true);
    print_r($payload);

    echo "Now checking validate:\n";
    if (now()->timestamp > $payload['exp']) {
        echo "Expired!\n";
    } else {
        echo 'Not expired. Now find user: '.$payload['sub']."\n";
        $found = User::find($payload['sub']);
        echo 'Found: '.($found ? $found->email : 'None')."\n";
        echo 'Payload email: '.$payload['email']."\n";
        echo 'Found email: '.($found ? $found->email : '')."\n";
        echo 'Status: '.($found ? $found->status : '')."\n";
    }
} catch (Throwable $e) {
    echo 'Exception: '.$e->getMessage()."\n".$e->getTraceAsString()."\n";
}
