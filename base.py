import base64

def image_to_base64(src, output_file="base64_output.txt"):
    """
    Converts an image file to a Base64 string and saves it to a text file.

    :param src: Path to the image file (e.g., "profile.jpg").
    :param output_file: File to save the Base64 string (default: "base64_output.txt").
    """
    try:
        with open(src, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')

        base64_data = f"data:image/jpeg;base64,{encoded_string}"  # Adjust format if needed

        with open(output_file, "w") as out_file:
            out_file.write(base64_data)

        print(f"Base64 string saved to: {output_file}")

    except FileNotFoundError:
        print("Error: File not found.")
    except Exception as e:
        print(f"An error occurred: {e}")

# Example Usage
src_image = "C:/Users/Lctiv/Bootstrap/assets/vance.jpg"  # Replace with your image path
output_text_file = "base64_output.txt"  # The file where Base64 will be saved

image_to_base64(src_image, output_text_file)