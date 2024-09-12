export async function fetchSpeakers() {
  const response = await fetch(
    "https://talks.ens.day/api/events/frensday-2024/speakers/"
  );
  const data = await response.json();
  return (data as any).results;
}
