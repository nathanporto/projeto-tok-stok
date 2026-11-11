<?php

namespace App\Support;

// Padroniza CNPJ e telefone antes de salvar, para que a mesma informação
// sempre fique gravada no mesmo formato (e a regra de CNPJ único funcione).
class Formatador
{
    // CNPJ alfanumérico (Receita Federal, jul/2026): 12 posições [0-9A-Z] + 2 dígitos verificadores.
    public const REGEX_CNPJ = '/^[0-9A-Z]{2}\.[0-9A-Z]{3}\.[0-9A-Z]{3}\/[0-9A-Z]{4}-\d{2}$/';

    public const REGEX_TELEFONE = '/^\(\d{2}\) \d{4,5}-\d{4}$/';

    public static function cnpj(?string $valor): ?string
    {
        $bruto = self::semPontuacao($valor);

        if ($bruto === '') {
            return null;
        }

        if (strlen($bruto) !== 14) {
            return $valor; // incompleto: deixa como veio para a validação recusar
        }

        return substr($bruto, 0, 2) . '.' . substr($bruto, 2, 3) . '.' . substr($bruto, 5, 3)
            . '/' . substr($bruto, 8, 4) . '-' . substr($bruto, 12, 2);
    }

    public static function telefone(?string $valor): ?string
    {
        $digitos = preg_replace('/\D/', '', (string) $valor);

        if ($digitos === '') {
            return null;
        }

        return match (strlen($digitos)) {
            10      => sprintf('(%s) %s-%s', substr($digitos, 0, 2), substr($digitos, 2, 4), substr($digitos, 6)),
            11      => sprintf('(%s) %s-%s', substr($digitos, 0, 2), substr($digitos, 2, 5), substr($digitos, 7)),
            default => $valor,
        };
    }

    public static function semPontuacao(?string $valor): string
    {
        return strtoupper((string) preg_replace('/[^0-9A-Za-z]/', '', (string) $valor));
    }
}
