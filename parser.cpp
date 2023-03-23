#include <fstream>
#include <iostream>
#include <nlohmann/json.hpp>
#include <string>
#include <vector>
using json = nlohmann::json;

using namespace std;

int main()
{

    // get the uploaded file details from data.json
    std::ifstream f("file-handler/data.json");
    json data = json::parse(f);
    std::string filename = "";
    for (auto &element : data.items())
    {
        std::cout << element.key() << " : ";

        // check if the value is a string or an object
        if (element.value().is_string())
        {
            std::cout << element.value().get<std::string>();
        }
        else if (element.value().is_array())
        {
            for (auto &item : element.value())
            {
                for (auto &subitem : item.items())
                {

                    // get the file name parameter
                    if (subitem.key() == "originalFilename")
                    {
                        filename = subitem.value();
                    }
                    std::cout << subitem.key() << " - " << subitem.value() << " | ";
                }
            }
        }
        else
        {
            std::cout << element.value().get<int>();
        }

        std::cout << std::endl;
    }

    std::cout << "Filename : " << filename << std::endl;

    // read the file based on the filename recieved above

    std::ifstream file_in("file-handler/uploads/" + filename);
    int iter = 0;
    std::vector<std::string> ged;
    while (!file_in.eof())
    {

        std::string text;

        getline(file_in, text);
        ged.push_back(text);
        iter++;
        if (iter == 21)
            break;
    }

    // write the parsed output to parser.json file

    json result = json::array();
    for (int i = 0; i < 20; i++)
    {
        json j = {
            {"id", i},
            {"data", ged[i]}};
        result.push_back(j);
    }

    {
        std::ofstream f("parser.json", std::ios_base::trunc | std::ios_base::out);
        f << result;
    }

    std::cout << "checker12 ";
    return 0;
}
