<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Fornecedor extends Model
{
    protected $table = 'fornecedores';

    protected $fillable = ['nome', 'cnpj', 'telefone', 'email'];

    public function produtos(): HasMany
    {
        return $this->hasMany(Produto::class);
    }
}
