import torch
import torch.nn as nn
from transformers import AutoModelForCausalLM, AutoTokenizer

model_name = "llama-2"

# Load tokenizer
tokenizer = AutoTokenizer.from_pretrained(model_name)
# Load original model
original_model = AutoModelForCausalLM.from_pretrained(model_name)


class SplitModel(nn.Module):
    def __init__(self, original_model, part1_gpu='cuda:0', part2_gpu='cuda:1'):
        super(SplitModel, self).__init__()
        # Assuming the original model has a sequential layer structure
        layers = list(original_model.children())
        # Assign each part to the specified GPU
        self.part1 = nn.Sequential(*layers[:len(layers)//2]).to(part1_gpu)
        self.part2 = nn.Sequential(*layers[len(layers)//2:]).to(part2_gpu)
    def forward(self, x):
        # Move the input to the same device as part1
        part1_device = next(self.part1.parameters()).device
        x = x.to(part1_device)
        intermediate_output = self.part1(x)
        actual_tensor = intermediate_output if isinstance(intermediate_output, torch.Tensor) else intermediate_output.last_hidden_state
        # Move the tensor to the device of part2
        part2_device = next(self.part2.parameters()).device
        actual_tensor = actual_tensor.to(part2_device)
        final_output = self.part2(actual_tensor)
        return final_output
    

# Initialize the Split Model
split_model = SplitModel(original_model)

def process_text(input_text, model, tokenizer, max_length=50, preferred_gpu='cuda:1'):
    # Check if the preferred GPU is available
    if torch.cuda.is_available() and preferred_gpu in [f'cuda:{i}' for i in range(torch.cuda.device_count())]:
        device = torch.device(preferred_gpu)
    else:
        # Fallback to default device (usually cuda:0)
        device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
    # Move model to the chosen device
    model = model.to(device)
    model.eval()
    # Encode the initial input text and move to the chosen device
    input_ids = tokenizer.encode(input_text, return_tensors='pt').to(device)
    with torch.no_grad():
        for _ in range(max_length):
            output = model(input_ids)
            logits = output.logits if hasattr(output, 'logits') else output
            # Get the last predicted token ID
            next_token_id = logits[:, -1, :].argmax(dim=-1, keepdim=True).to(device)
            # Check for end-of-sequence token (if applicable)
            if next_token_id.item() == tokenizer.eos_token_id:
                break
            # Concatenate the new token ID with the previous input_ids
            input_ids = torch.cat([input_ids, next_token_id], dim=-1)
    # Decode and return the generated sequence
    generated_sequence = tokenizer.decode(input_ids[0].tolist())
    return generated_sequence

print(process_text("Here is python code for adding:", split_model, tokenizer, max_length=50))
