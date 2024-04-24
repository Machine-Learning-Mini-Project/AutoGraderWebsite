#include <iostream>
#include <algorithm>
#include <vector>

int main() {
    // Declare a vector of strings
    std::vector<std::string> words = { "banana", "orange", "grape", "pineapple" , "apple"};

    // Print the sorted vector
    std::cout << "Sorted words:" << std::endl;
    for (const auto& word : words) {
        std::cout << word << std::endl;
    }

    return 0;
}
