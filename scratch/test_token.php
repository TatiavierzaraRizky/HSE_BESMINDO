<?php

use App\Models\User;
use App\Services\AuthTokenService;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Http\Request;

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

$user = User::first();
echo 'User: '.($user ? $user->email : 'None')."\n";
$token = AuthTokenService::generateToken($user);
echo 'Token: '.substr($token, 0, 30)."...\n";
$validated = AuthTokenService::validateToken($token);
echo 'Validated: '.($validated ? $validated->email : 'NULL')."\n";

$req = Request::create('/auth/current-user', 'GET');
$req->headers->set('X-Besmindo-Tab-Token', $token);
$resolved = AuthTokenService::resolveUserFromRequest($req);
echo 'Resolved via header: '.($resolved ? $resolved->email : 'NULL')."\n";
