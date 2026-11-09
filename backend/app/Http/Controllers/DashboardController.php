<?php

namespace App\Http\Controllers;

use App\Models\Movimentacao;
use App\Models\Produto;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

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
            'grafico'               => $this->ultimosSeteDias(),
        ]);
    }

    // Quantidade de unidades que entraram e saíram em cada um dos últimos 7 dias.
    private function ultimosSeteDias(): array
    {
        $inicio = Carbon::today()->subDays(6);

        $totais = Movimentacao::query()
            ->selectRaw('data, tipo, SUM(quantidade) as total')
            ->whereDate('data', '>=', $inicio)
            ->groupBy('data', 'tipo')
            ->get()
            ->groupBy(fn ($linha) => $linha->data->format('Y-m-d'));

        return collect(range(0, 6))->map(function ($i) use ($inicio, $totais) {
            $dia = $inicio->copy()->addDays($i)->format('Y-m-d');
            $doDia = $totais->get($dia, collect());

            return [
                'data'     => $dia,
                'entradas' => (int) $doDia->firstWhere('tipo', 'entrada')?->total,
                'saidas'   => (int) $doDia->firstWhere('tipo', 'saida')?->total,
            ];
        })->all();
    }
}
