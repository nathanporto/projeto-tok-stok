<?php

namespace App\Http\Controllers;

use App\Models\Fornecedor;
use App\Support\Formatador;
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
                // Permite achar "12.345.678/0001-90" digitando só "12345678".
                $termoLimpo = Formatador::semPontuacao($request->string('busca'));

                $query->where(function ($q) use ($termo, $termoLimpo) {
                    $q->where('nome', 'ilike', $termo)
                        ->orWhere('email', 'ilike', $termo)
                        ->orWhere('cnpj', 'ilike', $termo)
                        ->orWhere('telefone', 'ilike', $termo);

                    if ($termoLimpo !== '') {
                        $q->orWhereRaw("regexp_replace(cnpj, '[^0-9A-Za-z]', '', 'g') ilike ?", ["%{$termoLimpo}%"])
                            ->orWhereRaw("regexp_replace(telefone, '[^0-9]', '', 'g') ilike ?", ["%{$termoLimpo}%"]);
                    }
                });
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
        $request->merge([
            'cnpj'     => Formatador::cnpj($request->input('cnpj')),
            'telefone' => Formatador::telefone($request->input('telefone')),
        ]);

        return $request->validate([
            'nome'     => ['required', 'string', 'max:255'],
            'cnpj'     => ['nullable', 'string', 'regex:' . Formatador::REGEX_CNPJ, Rule::unique('fornecedores', 'cnpj')->ignore($fornecedor)],
            'telefone' => ['nullable', 'string', 'regex:' . Formatador::REGEX_TELEFONE],
            'email'    => ['nullable', 'email', 'max:255'],
        ], [
            'nome.required'  => 'Informe o nome do fornecedor.',
            'cnpj.regex'     => 'CNPJ incompleto ou inválido. Use o formato 00.000.000/0000-00.',
            'cnpj.unique'    => 'Já existe um fornecedor com esse CNPJ.',
            'telefone.regex' => 'Telefone incompleto. Informe DDD + número, ex.: (11) 91234-5678.',
            'email.email'    => 'Informe um e-mail válido.',
        ]);
    }
}
