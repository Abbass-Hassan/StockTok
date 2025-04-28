<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add new columns
            $table->foreignId('user_type_id')->constrained('user_types');
            $table->string('username')->unique();
            $table->string('profile_photo_url')->nullable();
            $table->text('bio')->nullable();
            $table->string('phone')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['user_type_id']);
            $table->dropColumn([
                'user_type_id',
                'username',
                'profile_photo_url',
                'bio',
                'phone'
            ]);
            
        });
    }
};