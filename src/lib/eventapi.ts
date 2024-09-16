export async function fetchSpeakers() {
  const response = await fetch(
    "https://talks.ens.day/api/events/frensday-2024/speakers/"
  );
  const data = await response.json();
  const speakerInfo = (data as any).results
    .map(
      (speaker: any) =>
        `Name: ${speaker.name}\nBiography: ${speaker.biography}\nAvatar: ${speaker.avatar}\n---\n`
    )
    .join("");
  return "# Event Speakers:\n" + speakerInfo;
}
