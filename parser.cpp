#include <fstream>
#include <iostream>
#include "json.hpp"
#include <string>
#include <vector>
#include "sqlite3.h"

using json = nlohmann::json;

using namespace std;

// Define a class to represent an Individual
class Individual
{
public:
    std::string id;
    std::string name;
    // You can add more member variables for other individual attributes

    Individual(const std::string &id) : id(id) {}

    void setName(const std::string &newName)
    {
        name = newName;
    }

    // Define member functions for other attributes as needed
};

// Define a class to represent the GEDCOM parser
class GEDCOMParser
{
public:
    GEDCOMParser(const std::string &filePath) : filePath(filePath) {}

    // Parse the GEDCOM file and store individuals
    void parse()
    {
        std::ifstream file(filePath);
        std::string line;

        while (std::getline(file, line))
        {
            parseLine(line);
        }
        if (currentIndividual != nullptr)
        {
            individuals[currentIndividual->id] = currentIndividual;
            currentIndividual = nullptr;
        }
    }

    // Get a map of individuals
    std::map<std::string, Individual *> getIndividuals()
    {
        return individuals;
    }

private:
    std::string filePath;
    std::map<std::string, Individual *> individuals;
    Individual *currentIndividual = nullptr;

    void parseLine(const std::string &line)
    {
        // Split the line into level, tag, and value
        std::size_t firstSpace = line.find(" ");
        std::size_t secondSpace = line.find(" ", firstSpace + 1);

        if (firstSpace != std::string::npos && secondSpace != std::string::npos)
        {
            // Extract the level, tag, and value using substrings
            std::string levelStr = line.substr(0, firstSpace);
            std::string tag = line.substr(firstSpace + 1, secondSpace - firstSpace - 1);
            std::string value = line.substr(secondSpace + 1);

            try
            {
                int level = std::stoi(levelStr);
                processGEDCOMRecord(level, tag, value);
            }
            catch (std::invalid_argument &e)
            {
                std::cerr << "Error parsing level as an integer: " << e.what() << std::endl;
            }
        }
        else
        {
            // Handle lines that do not follow the GEDCOM format
            // std::cerr << "Invalid GEDCOM line: " << line << std::endl;
        }
    }

    // Helper function to parse a single line
    void processGEDCOMRecord(int level, std::string &tag, std::string &value)
    {
        if (value == "INDI")
        {
            std::string temp = tag;
            tag = value;
            value = temp;
        }
        // Check if the line is an individual (INDI) record
        if (tag == "INDI")
        {
            if (currentIndividual != nullptr)
            {
                individuals[currentIndividual->id] = currentIndividual;
                currentIndividual = nullptr;
            }
            currentIndividual = new Individual(value);
        }
        // Handle other tags like "NAME", "BIRT", etc. to populate individual attributes
        else if (tag == "NAME" && currentIndividual)
        {
            currentIndividual->setName(value);
        }
        // Add more handlers for other tags as needed
    }
};

int main()
{

    const char *databaseFileName = "database.db";
    if (!std::ifstream(databaseFileName))
    {
        std::cerr << "Database file doesn't exist; creating it..." << std::endl;
        std::ofstream createDB(databaseFileName);
        createDB.close();
    }

    sqlite3 *db;
    char *errMsg = 0;

    // Open the SQLite database
    int rc = sqlite3_open(databaseFileName, &db);
    if (rc)
    {
        std::cerr << "Can't open database: " << sqlite3_errmsg(db) << std::endl;
        return 1;
    }

    const char *createTableSQL = "CREATE TABLE Individuals (ID TEXT PRIMARY KEY, Name TEXT)";

    rc = sqlite3_exec(db, createTableSQL, 0, 0, &errMsg);
    if (rc != SQLITE_OK)
    {
        std::cerr << "SQL error: " << errMsg << std::endl;
        sqlite3_free(errMsg);
    }
    else
    {
        std::cout << "Table created successfully." << std::endl;
    }

    // Create the SQL statement for inserting data
    const char *insertSQL = "INSERT INTO Individuals (ID, Name) VALUES (?, ?)";
    sqlite3_stmt *stmt;

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
                    if (subitem.key() == "path")
                    {
                        filename = subitem.value();
                        filename = filename.substr(8);
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

    string filepath = "file-handler/uploads/" + filename;

    GEDCOMParser parser(filepath);
    parser.parse();

    std::map<std::string, Individual *> individuals = parser.getIndividuals();

    for (const auto &entry : individuals)
    {
        const Individual *individual = entry.second;
        // std::cout << "ID: " << individual->id << ", Name: " << individual->name << std::endl;
        // Output other individual attributes as needed
        rc = sqlite3_prepare_v2(db, insertSQL, -1, &stmt, 0);
        if (rc != SQLITE_OK)
        {
            std::cerr << "SQL error: " << sqlite3_errmsg(db) << std::endl;
            continue; // Handle the error as needed
        }

        // Bind the ID and Name values to the SQL statement
        sqlite3_bind_text(stmt, 1, individual->id.c_str(), -1, SQLITE_STATIC);
        sqlite3_bind_text(stmt, 2, individual->name.c_str(), -1, SQLITE_STATIC);

        // Execute the SQL statement
        rc = sqlite3_step(stmt);
        if (rc != SQLITE_DONE)
        {
            std::cerr << "SQL error: " << sqlite3_errmsg(db) << std::endl;
        }

        sqlite3_finalize(stmt); // Finalize the statement
    }

    // Close the SQLite database
    sqlite3_close(db);

    // // read the file based on the filename recieved above

    // std::ifstream file_in("file-handler/uploads/" + filename);
    // int iter = 0;
    // std::vector<std::string> ged;
    // while (!file_in.eof())
    // {

    //     std::string text;

    //     getline(file_in, text);
    //     ged.push_back(text);
    //     iter++;
    //     if (iter == 21)
    //         break;
    // }

    // // write the parsed output to parser.json file

    // json result = json::array();
    // for (int i = 0; i < 20; i++)
    // {
    //     json j = {
    //         {"id", i},
    //         {"data", ged[i]}};
    //     result.push_back(j);
    // }

    // {
    //     std::ofstream f("parser.json", std::ios_base::trunc | std::ios_base::out);
    //     f << result;
    // }

    return 0;
}
