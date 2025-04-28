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
        Schema::create('videos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('video_url');
            $table->string('thumbnail_url')->nullable();
            $table->text('caption')->nullable();
            $table->float('initial_investment');
            $table->float('upload_fee');
            $table->integer('view_count')->default(0);
            $table->integer('like_investment_count')->default(0);
            $table->float('current_value')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('videos');
    }
};