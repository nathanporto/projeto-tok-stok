<?php

namespace App\Http\Controllers;

use App\Models\Produto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProdutoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $produtos = Produto::query()
            ->with(['categoria:id,nome', 'fornecedor:id,nome'])
            ->when($request->filled('busca'), function ($query) use ($request) {
                $termo = '%' . $request->string('busca') . '%';
                $query->where(fn ($q) => $q->where('nome', 'ilike', $termo)->orWhere('codigo', 'ilike', $termo));
            })
            ->when($request->filled('categoria_id'), fn ($q) => $q->where('categoria_id', $request->integer('categoria_id')))
            ->when($request->filled('fornecedor_id'), fn ($q) => $q->where('fornecedor_id', $request->integer('fornecedor_id')))
            ->when($request->input('situacao') === 'sem_estoque', fn ($q) => $q->where('quantidade', 0))
            ->when($request->input('situacao') === 'baixo', fn ($q) => $q->where('quantidade', '>', 0)->whereColumn('quantidade', '<', 'estoque_minimo'))
            ->when($request->input('situacao') === 'regular', fn ($q) => $q->whereColumn('quantidade', '>=', 'estoque_minimo')->where('quantidade', '>', 0))
            ->orderBy('nome')
            ->get();

        return response()->json($produtos);
    }

    public function show(Produto $produto): JsonResponse
    {
        return response()->json($produto->load(['categoria:id,nome', 'fornecedor:id,nome']));
    }

    public function store(Request $request): JsonResponse
    {
        $produto = Produto::create($this->validar($request));

        return response()->json($produto->load(['categoria:id,nome', 'fornecedor:id,nome']), 201);
    }

    public function update(Request $request, Produto $produto): JsonResponse
    {
        $produto->update($this->validar($request, $produto));

        return response()->json($produto->load(['categoria:id,nome', 'fornecedor:id,nome']));
    }

    public function destroy(Produto $produto): JsonResponse
    {
        $produto->delete();

        return response()->json(null, 204);
    }

    private function validar(Request $request, ?Produto $produto = null): array
    {
        return $request->validate([
            'codigo'         => ['required', 'string', 'max:50', Rule::unique('produtos', 'codigo')->ignore($produto)],
            'nome'           => ['required', 'string', 'max:255'],
            'categoria_id'   => ['nullable', 'integer', 'exists:categorias,id'],
            'fornecedor_id'  => ['nullable', 'integer', 'exists:fornecedores,id'],
            'quantidade'     => ['required', 'integer', 'min:0'],
            'estoque_minimo' => ['required', 'integer', 'min:0'],
            'estoque_maximo' => ['required', 'integer', 'min:0', 'gte:estoque_minimo'],
            'preco_custo'    => ['required', 'numeric', 'min:0'],
        ], [
            'codigo.required'    => 'Informe o código do produto.',
            'codigo.unique'      => 'Já existe um produto com esse código.',
            'nome.required'      => 'Informe o nome do produto.',
            'estoque_maximo.gte' => 'O estoque máximo deve ser maior ou igual ao mínimo.',
        ]);
    }
}
