import Link from 'next/link'
import { useRouter } from 'next/router'
import { List, ListItem, ListIcon, OrderedList, UnorderedList, Stack, Text, Avatar, AvatarBadge, AvatarGroup, WrapItem } from "@chakra-ui/react"
import { NextSeo } from 'next-seo';
import { withUrqlClient, initUrqlClient } from 'next-urql';
import { ssrExchange, dedupExchange, cacheExchange, fetchExchange, useQuery } from 'urql';

const SingleCharacterQuery = `
  query ($characterId: ID!) {
    character(id: $characterId) {
      id
      image
      name
      status
      species
      created
      gender
      origin {
        name
      }
      location {
        name
      }
      episode {
        id
        name
      }
    }
  }
`;

function Todos() {
  const { query } = useRouter()
  const { id:characterId } = query
  const [res] = useQuery({ query: SingleCharacterQuery, variables: {characterId} });
  const { data, fetching: isLoading, error } = res;
  if (isLoading || error) {
    return null
  }

  return (
    <>
      <NextSeo
          title={data.character.name}
          description="rick and morty character"
      />
      <WrapItem>
        <Avatar size="2xl" name="Segun Adebayo" src={data.character.image} />{" "}
      </WrapItem>
      <Stack>
        <Text color="white" fontSize="2xl">{data.character.name}</Text>
      </Stack>  
      <UnorderedList>
          { !isLoading && data && data.character.episode.map((epi)=>(
            <Link href={`/episode/${epi.id}`} key={epi.id} >
              <ListItem color="white" fontSize="l" cursor="pointer">{epi.name}</ListItem>
            </Link>
          ))}
      </UnorderedList>
    </>
  );
}

export async function getServerSideProps(ctx) {
  //console.log("server!", ctx)
  const characterId = ctx.query.id;
  const ssrCache = ssrExchange({ isClient: false });
  const client = initUrqlClient({
    url: 'https://rickandmortyapi.com/graphql',
    exchanges: [dedupExchange, cacheExchange, ssrCache, fetchExchange],
  }, true);

  // This query is used to populate the cache for the query
  // used on this page.
  await client.query(SingleCharacterQuery, {characterId}).toPromise();

  return {
    props: {
      // urqlState is a keyword here so withUrqlClient can pick it up.
      urqlState: ssrCache.extractData(),
    },
  };
}

export default withUrqlClient(
  ssr => ({
    url: 'https://rickandmortyapi.com/graphql',
  }),
  { ssr: false } // Important so we don't wrap our component in getInitialProps
)(Todos);