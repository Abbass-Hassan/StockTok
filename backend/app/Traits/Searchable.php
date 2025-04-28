<?php

namespace App\Traits;

trait Searchable
{
    /**
     * Scope a query to search for a term in specified columns.
     */
    public function scopeSearch($query, $term, $columns = [])
    {
        if (empty($term) || empty($columns)) {
            return $query;
        }

        return $query->where(function ($query) use ($term, $columns) {
            foreach ($columns as $column) {
                $query->orWhere($column, 'LIKE', "%{$term}%");
            }
        });
    }
}