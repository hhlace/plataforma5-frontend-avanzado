import { useQuery } from 'urql';
import { useRouter } from 'next/router';
import { Stack,  Text } from '@chakra-ui/layout';
import { Card } from '../index'
import { NextSeo } from 'next-seo';

const SingleEpisodeQuery = `
    query ($episodeId: ID!) {
        episode(id: $episodeId) {
            id
            name
            episode 
            air_date
            characters {
                id
                name
                image
                status
                species
                location {
                    name
                }
                episode{
                    name
                }
            }
            created
        }
    }
`

function EpisodePage() {
    const { query } = useRouter()

    const { id } = query

    const [result] = useQuery({
        query: SingleEpisodeQuery,
        variables: { episodeId: id }
    })

    const {data, fetching: isLoading, error } = result;


    if( isLoading || error ) {
        return null
    }

    return (
        <>
        <NextSeo
          title={data.episode.name}
          description="rick and morty episode"
        />
        <Stack>
            <Text color="white" fontSize="2xl">{data.episode.name}</Text>
            <Text color="white" fontSize="l">{data.episode.episode}</Text>
            <Text color="white" fontSize="l"> Release date : {data.episode.air_date}</Text>
            <Text color="white" fontSize="l">characters: </Text>
        </Stack>
        { !isLoading && data && data.episode.characters.map(character=> (
            <Card
            key={character.id}
            id={character.id}
            imageLink={character.image}
            name={character.name}
            status={character.status}
            specie={character.species}
            lastLocation={character.location.name}
            firstSeenIn={character.episode[0].name}
          />
        ))}

        </>
    )
}

export default EpisodePage;