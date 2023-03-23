#include <fstream>
#include <iostream>
#include <nlohmann/json.hpp>
#include <string>
#include <vector>
using json = nlohmann::json;

int main()
{
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

    std::ifstream file_in("file-handler/uploads/" + filename);
    int iter = 0;
    std::vector<std::string> ged;
    while (!file_in.eof())
    {

        std::string text;

        getline(file_in, text);
        ged.push_back(text);
        iter++;
        if (iter == 6)
            break;
    }

    json result = json::array();
    for (int i = 0; i < 6; i++)
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

    // std::ifstream f1("parser.json");
    // json data1 = json::parse(f1);

    // // create a new object to be added to the "school" array
    // json new_object = {{"name", "ABC School"}, {"date", "2022"}};

    // // add the new object to the "school" array
    // data1["school"].push_back(new_object);

    // // write the updated JSON object to the file
    // std::ofstream out1("parser.json");

    // // add a new string to the existing JSON object
    // data1["new_string"] = "hello world";

    // // write the updated JSON object to the file
    // out1 << data;

    // json result = json::array();
    // for (int i = 0; i < 4; i++)
    // {
    //     json j = {
    //         {"id", i},
    //         {"qty", i},
    //         {"price", i}};
    //     result.push_back(j);
    // }

    // {
    //     std::ofstream f("parser.json", std::ios_base::trunc | std::ios_base::out);
    //     f << result;
    // }
    std::cout << "checker12 ";
    return 0;
}
