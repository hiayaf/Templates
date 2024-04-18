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
1. Settings:
    - guildType:
        - GuildTypeSocial  
        - GuildTypeFriends
        - GuildTypeGame 
    - channelParam:
        - placeholders:
            - {name}
            - {emoji}
    - categoryParam:
        - placeholders:
            - {name}
            - {emoji}
    - channelfont:
        - Default
        - Fraktur
        - Script Bold
        - MonoSpce
        - Bold
        - HandWrite
        - Aesthetic
        - Underline
        - StrikeThrough
        - Aggressive
        - Mafia
        - ScriptCursive
    - categoryfont:
        - Default
        - Fraktur
        - Script Bold
        - MonoSpce
        - Bold
        - HandWrite
        - Aesthetic
        - Underline
        - StrikeThrough
        - Aggressive
        - Mafia
        - ScriptCursive
    - Channel: 
        - array:
            - autoRolesChannel
            - filmChannel
            - verifyChannel
            - gamesChannel
            - ticketChannel
            - boostChannel
            - technoChannel
            - faqChannel
            - memesChannel
            - cmdChannel
            - logsChannel
            - adminChannel
            - suggestionChannel
            - graphicChannel
            - changelogChannel
            - giveawayChannel
            - pollChannel
            - eventChannel
            - infoChannel
            - codeChannel
            - offtopChannel
            - socialChannel
            - helpChannel
            - gamersChannel
            - bookChannel
            - sportChannel