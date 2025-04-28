<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DepositRequest extends FormRequest
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
            'name_on_card' => 'required|string|max:255',
            'card_number' => 'required|string|size:16',
            'expiry_date' => 'required|string|regex:/^(0[1-9]|1[0-2])\/([0-9]{2})$/',
            'ccv' => 'required|string|size:3',
            'amount' => 'required|numeric|min:10',
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
            'name_on_card.required' => 'Name on card is required',
            'card_number.required' => 'Card number is required',
            'card_number.size' => 'Card number must be 16 digits',
            'expiry_date.required' => 'Expiry date is required',
            'expiry_date.regex' => 'Expiry date must be in the format MM/YY',
            'ccv.required' => 'CCV is required',
            'ccv.size' => 'CCV must be 3 digits',
            'amount.required' => 'Deposit amount is required',
            'amount.numeric' => 'Deposit amount must be a number',
            'amount.min' => 'Minimum deposit amount is $10',
        ];
    }
}