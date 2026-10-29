<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Produto extends Model
{
    protected $table = 'produtos';

    protected $fillable = [
        'codigo',
        'nome',
        'categoria_id',
        'fornecedor_id',
        'quantidade',
        'estoque_minimo',
        'estoque_maximo',
        'preco_custo',
    ];

    protected function casts(): array
    {
        return [
            'quantidade'     => 'integer',
            'estoque_minimo' => 'integer',
            'estoque_maximo' => 'integer',
            'preco_custo'    => 'decimal:2',
        ];
    }

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class);
    }

    public function fornecedor(): BelongsTo
    {
        return $this->belongsTo(Fornecedor::class);
    }

    public function movimentacoes(): HasMany
    {
        return $this->hasMany(Movimentacao::class);
    }
}
