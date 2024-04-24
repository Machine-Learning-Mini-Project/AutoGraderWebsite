#include <iostream>
#include <algorithm>
#include <vector>

int main() {
    // Declare a vector of strings
    std::vector<std::string> words = {"apple", "banana", "orange", "grape", "pineapple"};

    // Sort the vector in lexicographical order
    std::sort(words.begin(), words.end());

    // Print the sorted vector
    std::cout << "Sorted words:" << std::endl;
    for (const auto& word : words) {
        std::cout << word << std::endl;
    }

    return 0;
}
