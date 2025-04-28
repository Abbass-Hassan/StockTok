<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VideoUploadRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'video_file' => 'required|file|mimes:mp4,mov,avi|max:100000', // Max 100MB
            'thumbnail' => 'nullable|image|max:2048', // Max 2MB
            'caption' => 'required|string|max:500',
            'initial_investment' => 'required|numeric|min:10',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'video_file.required' => 'Please select a video file to upload',
            'video_file.file' => 'The upload must be a valid file',
            'video_file.mimes' => 'Only MP4, MOV, and AVI video formats are supported',
            'video_file.max' => 'Video size cannot exceed 100MB',
            'thumbnail.image' => 'Thumbnail must be an image',
            'thumbnail.max' => 'Thumbnail cannot be larger than 2MB',
            'caption.required' => 'Please provide a caption for your video',
            'initial_investment.required' => 'Initial investment amount is required',
            'initial_investment.numeric' => 'Initial investment must be a number',
            'initial_investment.min' => 'Initial investment must be at least $10',
        ];
    }
}