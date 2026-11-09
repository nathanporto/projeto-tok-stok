<?php

namespace App\Http\Controllers;

use App\Models\Movimentacao;
use App\Models\Produto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class MovimentacaoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $movimentacoes = Movimentacao::query()
            ->with(['produto:id,nome,codigo', 'fornecedor:id,nome', 'user:id,name'])
            ->filtrar($request)
            ->latest('data')
            ->latest('id')
            ->limit(500)
            ->get();

        return response()->json($movimentacoes);
    }

    public function store(Request $request): JsonResponse
    {
        $dados = $request->validate([
            'tipo'          => ['required', Rule::in(['entrada', 'saida'])],
            'produto_id'    => ['required', 'integer', 'exists:produtos,id'],
            'quantidade'    => ['required', 'integer', 'min:1'],
            'data'          => ['required', 'date', 'before_or_equal:today'],
            'fornecedor_id' => ['nullable', 'integer', 'exists:fornecedores,id'],
            'motivo'        => ['nullable', 'required_if:tipo,saida', 'string', 'max:255'],
            'observacao'    => ['nullable', 'string', 'max:255'],
        ], [
            'produto_id.required'   => 'Selecione um produto.',
            'quantidade.required'   => 'Informe a quantidade.',
            'quantidade.integer'    => 'A quantidade deve ser um número inteiro.',
            'quantidade.min'        => 'A quantidade deve ser de pelo menos 1 unidade.',
            'data.required'         => 'Informe a data da movimentação.',
            'data.before_or_equal'  => 'A data não pode estar no futuro.',
            'motivo.required_if'    => 'Informe o motivo da saída.',
        ]);

        $movimentacao = DB::transaction(function () use ($dados, $request) {
            // Trava a linha do produto: duas saídas simultâneas não conseguem
            // ler o mesmo saldo e ambas passarem na validação.
            $produto = Produto::lockForUpdate()->findOrFail($dados['produto_id']);

            if ($dados['tipo'] === 'saida' && $dados['quantidade'] > $produto->quantidade) {
                throw ValidationException::withMessages([
                    'quantidade' => "Saída de {$dados['quantidade']} un. bloqueada: saldo disponível de {$produto->quantidade} un.",
                ]);
            }

            $novoSaldo = $dados['tipo'] === 'entrada'
                ? $produto->quantidade + $dados['quantidade']
                : $produto->quantidade - $dados['quantidade'];

            $produto->update(['quantidade' => $novoSaldo]);

            return Movimentacao::create([
                ...$dados,
                'fornecedor_id'    => $dados['tipo'] === 'entrada' ? ($dados['fornecedor_id'] ?? null) : null,
                'motivo'           => $dados['tipo'] === 'saida' ? $dados['motivo'] : null,
                'saldo_resultante' => $novoSaldo,
                'user_id'          => $request->user()->id,
            ]);
        });

        return response()->json(
            $movimentacao->load(['produto:id,nome,codigo', 'fornecedor:id,nome', 'user:id,name']),
            201
        );
    }
}
