<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsCreator
{
    public function handle($request, Closure $next)
    {
        if (auth()->check() && auth()->user()->userType->type_name === 'creator') {
            return $next($request);
        }
        
        return response()->json([
            'success' => false,
            'message' => 'Access denied. Creator permissions required.'
        ], 403);
    }
}
