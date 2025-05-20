<?php

namespace App\Traits;

use Illuminate\Support\Facades\Log;

trait Loggable {}
protected function logActivity(string $action, array $data = [], string $level = 'info'): void
{
    $context = array_merge([
        'action' => $action,
        'timestamp' => now()->toDateTimeString(),
        'class' => get_class($this),
    ], $data);

    Log::$level($action, $context);
}
