<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsRegular
{
    public function handle($request, Closure $next)
    {
        if (auth()->check() && auth()->user()->userType->type_name === 'regular') {
            return $next($request);
        }
        
        return response()->json([
            'success' => false,
            'message' => 'Access denied. Regular user permissions required.'
        ], 403);
    }
}