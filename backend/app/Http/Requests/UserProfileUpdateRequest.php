<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserProfileUpdateRequest extends FormRequest
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
            'username' => [
                'required',
                'string',
                'max:30',
                Rule::unique('users')->ignore($this->user()->id)
            ],
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'gender' => 'required|in:Male,Female',
            'bio' => 'nullable|string|max:500',
            'user_type_id' => 'required|exists:user_types,id',
            'profile_photo' => 'nullable|image|max:2048', // Max 2MB
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
            'username.required' => 'Username is required',
            'username.unique' => 'This username is already taken',
            'name.required' => 'Full name is required',
            'gender.required' => 'Please select your gender',
            'user_type_id.required' => 'Please select user type (Creator or Investor)',
            'profile_photo.image' => 'Profile photo must be an image',
            'profile_photo.max' => 'Profile photo cannot be larger than 2MB',
        ];
    }
}