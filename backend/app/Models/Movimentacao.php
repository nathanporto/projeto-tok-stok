<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Http\Request;

class Movimentacao extends Model
{
    protected $table = 'movimentacoes';

    protected $fillable = [
        'produto_id',
        'fornecedor_id',
        'user_id',
        'tipo',
        'quantidade',
        'saldo_resultante',
        'data',
        'motivo',
        'observacao',
    ];

    protected function casts(): array
    {
        return [
            'quantidade'       => 'integer',
            'saldo_resultante' => 'integer',
            'data'             => 'date:Y-m-d',
        ];
    }

    public function produto(): BelongsTo
    {
        return $this->belongsTo(Produto::class);
    }

    public function fornecedor(): BelongsTo
    {
        return $this->belongsTo(Fornecedor::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Filtros compartilhados pelo Histórico e pelos Relatórios.
    public function scopeFiltrar(Builder $query, Request $request): Builder
    {
        return $query
            ->when(in_array($request->input('tipo'), ['entrada', 'saida'], true), fn ($q) => $q->where('tipo', $request->input('tipo')))
            ->when($request->filled('produto_id'), fn ($q) => $q->where('produto_id', $request->integer('produto_id')))
            ->when($request->filled('data_inicio'), fn ($q) => $q->whereDate('data', '>=', $request->date('data_inicio')))
            ->when($request->filled('data_fim'), fn ($q) => $q->whereDate('data', '<=', $request->date('data_fim')))
            ->when($request->filled('busca'), function ($q) use ($request) {
                $termo = '%' . $request->string('busca') . '%';
                $q->where(fn ($sub) => $sub
                    ->where('motivo', 'ilike', $termo)
                    ->orWhere('observacao', 'ilike', $termo)
                    ->orWhereHas('produto', fn ($p) => $p->where('nome', 'ilike', $termo)->orWhere('codigo', 'ilike', $termo))
                    ->orWhereHas('fornecedor', fn ($f) => $f->where('nome', 'ilike', $termo)));
            });
    }
}
