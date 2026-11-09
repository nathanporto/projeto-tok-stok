<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    private const UNIDADES = ['Guarulhos · Matriz', 'São Paulo · CD Norte', 'Galpão C · Insumos'];

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email'    => ['required', 'string'],
            'password' => ['required', 'string'],
            'unidade'  => ['nullable', Rule::in(self::UNIDADES)],
        ]);

        // Aceita login por e-mail ou matrícula (username antes do @).
        $login = $credentials['email'];
        $field = str_contains($login, '@') ? 'email' : 'name';

        if (! $token = auth()->attempt([$field => $login, 'password' => $credentials['password']])) {
            return response()->json(['message' => 'Credenciais inválidas.'], 401);
        }

        // O operador registra em qual unidade está trabalhando neste turno.
        if (! empty($credentials['unidade'])) {
            auth()->user()->update(['unidade' => $credentials['unidade']]);
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
