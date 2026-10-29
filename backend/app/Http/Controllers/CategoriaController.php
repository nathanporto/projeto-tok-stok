<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CategoriaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $categorias = Categoria::query()
            ->when($request->filled('busca'), function ($query) use ($request) {
                $termo = '%' . $request->string('busca') . '%';
                $query->where(fn ($q) => $q->where('nome', 'ilike', $termo)->orWhere('descricao', 'ilike', $termo));
            })
            ->withCount('produtos')
            ->orderBy('nome')
            ->get();

        return response()->json($categorias);
    }

    public function store(Request $request): JsonResponse
    {
        $categoria = Categoria::create($this->validar($request));

        return response()->json($categoria, 201);
    }

    public function update(Request $request, Categoria $categoria): JsonResponse
    {
        $categoria->update($this->validar($request));

        return response()->json($categoria);
    }

    public function destroy(Categoria $categoria): JsonResponse
    {
        $categoria->delete();

        return response()->json(null, 204);
    }

    private function validar(Request $request): array
    {
        return $request->validate([
            'nome'      => ['required', 'string', 'max:255'],
            'descricao' => ['nullable', 'string', 'max:255'],
            'status'    => ['required', Rule::in(['ativa', 'inativa'])],
        ], [
            'nome.required' => 'Informe o nome da categoria.',
        ]);
    }
}
