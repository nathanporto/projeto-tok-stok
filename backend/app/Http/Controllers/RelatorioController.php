<?php

namespace App\Http\Controllers;

use App\Models\Movimentacao;
use App\Models\Produto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RelatorioController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'data_inicio' => ['nullable', 'date'],
            'data_fim'    => ['nullable', 'date', 'after_or_equal:data_inicio'],
            'produto_id'  => ['nullable', 'integer', 'exists:produtos,id'],
        ], [
            'data_fim.after_or_equal' => 'A data final deve ser igual ou posterior à data inicial.',
        ]);

        $produtos = Produto::query()
            ->with('categoria:id,nome')
            ->when($request->filled('produto_id'), fn ($q) => $q->whereKey($request->integer('produto_id')))
            ->orderBy('nome')
            ->get();

        $movimentacoes = Movimentacao::query()
            ->with(['produto:id,nome,codigo', 'fornecedor:id,nome'])
            ->filtrar($request)
            ->latest('data')
            ->latest('id')
            ->get();

        return response()->json([
            'estoque_atual'      => $produtos->sum('quantidade'),
            'valor_em_estoque'   => round($produtos->sum(fn ($p) => $p->quantidade * (float) $p->preco_custo), 2),
            'total_entradas'     => $movimentacoes->where('tipo', 'entrada')->sum('quantidade'),
            'total_saidas'       => $movimentacoes->where('tipo', 'saida')->sum('quantidade'),
            'produtos'           => $produtos,
            'produtos_baixo'     => $produtos->filter(fn ($p) => $p->quantidade < $p->estoque_minimo)->values(),
            'movimentacoes'      => $movimentacoes,
        ]);
    }
}
