<?php

return [

    'paths' => ['api/*'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    // FRONTEND_URL aceita uma ou mais origens separadas por vírgula
    // (ex.: "https://tok-stok.vercel.app,http://localhost:3000").
    'allowed_origins' => array_filter(array_map(
        'trim',
        explode(',', env('FRONTEND_URL', 'http://localhost:3000'))
    )),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
