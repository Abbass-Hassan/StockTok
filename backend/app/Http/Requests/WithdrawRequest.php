<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class WithdrawRequest extends FormRequest
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
            'card_number' => 'required|string|size:16',
            'note' => 'nullable|string|max:255',
            'amount' => [
                'required',
                'numeric',
                'min:10',
                function ($attribute, $value, $fail) {
                    $user = auth()->user();
                    if ($user && $user->wallet && $value > $user->wallet->balance) {
                        $fail('Withdrawal amount exceeds available balance.');
                    }
                },
            ],
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
            'card_number.required' => 'Card number is required',
            'card_number.size' => 'Card number must be 16 digits',
            'amount.required' => 'Withdrawal amount is required',
            'amount.numeric' => 'Withdrawal amount must be a number',
            'amount.min' => 'Minimum withdrawal amount is $10',
        ];
    }
}