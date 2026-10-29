<?php

namespace App\Http\Controllers;

use App\Models\Movimentacao;
use App\Models\Produto;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $alertas = Produto::query()
            ->with('categoria:id,nome')
            ->whereColumn('quantidade', '<', 'estoque_minimo')
            ->orderBy('quantidade')
            ->get();

        $ultimas = Movimentacao::query()
            ->with(['produto:id,nome,codigo', 'fornecedor:id,nome'])
            ->latest('data')
            ->latest('id')
            ->limit(5)
            ->get();

        return response()->json([
            'total_produtos'        => Produto::count(),
            'estoque_baixo'         => Produto::where('quantidade', '>', 0)->whereColumn('quantidade', '<', 'estoque_minimo')->count(),
            'sem_estoque'           => Produto::where('quantidade', 0)->count(),
            'total_entradas'        => Movimentacao::where('tipo', 'entrada')->count(),
            'total_saidas'          => Movimentacao::where('tipo', 'saida')->count(),
            'alertas'               => $alertas,
            'ultimas_movimentacoes' => $ultimas,
        ]);
    }
}
