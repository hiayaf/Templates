## Plik przykładowego szablonu do zaimportowania

```json
{
    "Settings": {
        "guildType": "GuildTypeSocial",
        "locale": "pl",
        "channelParam": "「{emoji}」{name}「{emoji}」",
        "categoryParam": "「{emoji}」{name}",
        "channelfont": "ScriptBold",
        "categoryfont": "ScriptBold",
        "Channel": {
            "array": "autoRolesChannel, filmChannel, verifyChannel, gamesChannel, ticketChannel, boostChannel, technoChannel, faqChannel, memesChannel, cmdChannel, logsChannel, adminChannel, suggestionChannel, graphicChannel, changelogChannel, giveawayChannel, pollChannel, eventChannel, infoChannel, codeChannel, offtopChannel, socialChannel, helpChannel, gamersChannel, bookChannel, sportChannel",
            "all": true,
            "force": "test"
        }
    }
}
```
"guildType":
 - "guildTypeSocial"
 - "guildTypeFriends"
 - "guildTypeGame"
"locale":
 - "pl" - Język Polski
 - "en" - Język Angielski 
 - "fr" - Język Francuski
- "de" - Język Niemiecki
"channelParam":
 - "{emoji} {name} bla bla bla" - {emoji} odpowiada ustawieniu przez bota emotki w danym miejscu nazwy kanału; {name} odpowiada nazwie kanału; bla bla bla odpowiada własnym znakom(symbole są domyślnie zablokowane w tworzeniu nazwy kanału więc będą pomijane, można stosować inne czcionki lub font generatory)
"categoryParam":
 - dokładnie takie same działania jak "channelParam"
"channelfont":
 - tutaj należy wpisać dowolny font z listy komendy /czcionki, który nam się podoba
"categoryfont":
 - dokładnie takie same działania jak "channelfont"
Channel:
 array: 
  - tablica listy kanałów możliwych do stworzenia:
   - autoRolesChannel, filmChannel, verifyChannel, gamesChannel, ticketChannel, boostChannel, technoChannel, faqChannel, memesChannel, cmdChannel, logsChannel, adminChannel, suggestionChannel, graphicChannel, changelogChannel, giveawayChannel, pollChannel, eventChannel, infoChannel, codeChannel, offtopChannel, socialChannel, helpChannel, gamersChannel, bookChannel, sportChannel
"all":
 - ustawienie odpowiadające za utworzenie wszystkich kanałów
"force": wsm nie pamiętam za co to odpowiada
