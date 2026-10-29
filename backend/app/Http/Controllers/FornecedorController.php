<?php

namespace App\Http\Controllers;

use App\Models\Fornecedor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class FornecedorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $fornecedores = Fornecedor::query()
            ->when($request->filled('busca'), function ($query) use ($request) {
                $termo = '%' . $request->string('busca') . '%';
                $query->where(fn ($q) => $q
                    ->where('nome', 'ilike', $termo)
                    ->orWhere('cnpj', 'ilike', $termo)
                    ->orWhere('email', 'ilike', $termo));
            })
            ->orderBy('nome')
            ->get();

        return response()->json($fornecedores);
    }

    public function store(Request $request): JsonResponse
    {
        $fornecedor = Fornecedor::create($this->validar($request));

        return response()->json($fornecedor, 201);
    }

    public function update(Request $request, Fornecedor $fornecedor): JsonResponse
    {
        $fornecedor->update($this->validar($request, $fornecedor));

        return response()->json($fornecedor);
    }

    public function destroy(Fornecedor $fornecedor): JsonResponse
    {
        $fornecedor->delete();

        return response()->json(null, 204);
    }

    private function validar(Request $request, ?Fornecedor $fornecedor = null): array
    {
        return $request->validate([
            'nome'     => ['required', 'string', 'max:255'],
            'cnpj'     => ['nullable', 'string', 'max:18', Rule::unique('fornecedores', 'cnpj')->ignore($fornecedor)],
            'telefone' => ['nullable', 'string', 'max:20'],
            'email'    => ['nullable', 'email', 'max:255'],
        ], [
            'nome.required' => 'Informe o nome do fornecedor.',
            'cnpj.unique'   => 'Já existe um fornecedor com esse CNPJ.',
            'email.email'   => 'Informe um e-mail válido.',
        ]);
    }
}
