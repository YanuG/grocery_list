const NotionSDK = require('@notionhq/client')
const core = require('@actions/core');

var myArgs = process.argv.slice(2);
var commandLineLength = myArgs.length;

const notionKey = commandLineLength >= 2 ? myArgs[0] : core.getInput('notion_key', { required: true });
const databaseId = commandLineLength >= 2 ? myArgs[1] : core.getInput('database_id', { required: true });

console.log(notionKey)
const notion = new NotionSDK.Client({ auth: notionKey });

async function retrieveDataBase() {

    let propertyList = []
    await notion.databases.retrieve({
        database_id: databaseId
    })
        .then(response => {
            
            for (let property in response.properties) {
                if (property != "Name")
                    propertyList.push(property)
            }


        })
        .catch(err => {
            console.log(err.message)
        })

    return propertyList
}

async function queryDataBase() {

    propertyList = await retrieveDataBase()
    items = {}

    for (const property of propertyList) {
        await notion.databases.query({

            database_id: databaseId,
            filter: {
                "property": property,
                "rich_text": {
                    "is_not_empty": true
                }
            }
            })
            .then(response => {
                items[property] =  response.results

            })
            .catch(err => {
                console.err(err.message)
            })
    }

}

async function searchPage()
{
    await notion.search({
          query: 'Falafel Wrap',
          sort: {
            direction: 'ascending',
            timestamp: 'last_edited_time',
          },
          filter: {
              "property": "object",
              "value": "page"
          }
        })
        .then(response => {
            console.log(response);
        })
}

queryDataBase()