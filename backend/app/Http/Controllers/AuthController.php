<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email'    => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        // Aceita login por e-mail ou matrícula (username antes do @).
        $login = $credentials['email'];
        $field = str_contains($login, '@') ? 'email' : 'name';

        if (! $token = auth()->attempt([$field => $login, 'password' => $credentials['password']])) {
            return response()->json(['message' => 'Credenciais inválidas.'], 401);
        }

        return response()->json([
            'token' => $token,
            'user'  => auth()->user(),
        ]);
    }

    public function me(): JsonResponse
    {
        return response()->json(auth()->user());
    }

    public function logout(): JsonResponse
    {
        auth()->logout();

        return response()->json(['message' => 'Logout realizado com sucesso.']);
    }
}
