export async function sendErrorWithSpoiler(
  interaction,
  error,
  message,
  ephemeral = process.env.NODE_ENV === 'development' ? false : true,
  spoiler = process.env.NODE_ENV === 'development' ? true : false
) {
  return await interaction.followUp({
    embeds: [
      {
        title: '❌ 오류',
        description: [
          message || 'Something went wrong',
          spoiler ? '' : null,
          spoiler ? '**에러 로그 (클릭해서 보기):**' : null,
          spoiler
            ? '||```js\n' + String(error.stack || error.message) + '\n```||'
            : null,
        ].join('\n'),
        color: 0xff0000,
      },
    ],
    ephemeral,
  });
}
