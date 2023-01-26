// Stage 1 - Get Videos URLs

let networkError;
// block(["*.png*","*.jpg*","*.mp4*","*.mp3*","*.svg*","*.webp*","*google.com*","*facebook.com*"])
let ERR_SSL_PROTOCOL_ERROR_COUNTER = 0;
verify_requests(({ url, error, type, response }) => {
  if (url.includes("https://www.youtube.com/s/desktop/")) networkError = error;
  if (type == "ERR_SSL_PROTOCOL_ERROR") ERR_SSL_PROTOCOL_ERROR_COUNTER++;
  if (ERR_SSL_PROTOCOL_ERROR_COUNTER > 10)
    throw new Error("too many errors ERR_SSL_PROTOCOL_ERROR");
});

let url = `https://www.youtube.com/@${input.channel_id}/videos`;

navigate(url, {
  wait_until: "navigate",
  referer: "https://www.youtube.com",
  timeout: 12e4,
});
wait_page_idle(5000);
try {
  wait('[id="contents"]', { timeout: 12e4 });
} catch (e) {
  throw new Error("The page was not loaded successfully. " + networkError);
}

let length_before = 0;
let retry_count = 3;
let links = [];
while (retry_count > 0) {
  scroll_to("bottom");
  wait_page_idle(3000, { timeout: 65000 });

  let links_ = parse().thumbnails;
  if (links_.length == length_before) retry_count--;
  length_before = links_.length;
  links = [...new Set([...links, ...links_].slice(0, 10))];
  console.log(links.length, links_.length);
  if (links.length >= 10) break; // check if links have reached 10
}

for (let link of links) {
  console.log(link);
  const url = "https://www.youtube.com/watch?v=" + link.split("/")[4];
  const thumbnail = link;
  console.log({
    channel_id: input.channel_id,
    url: url,
    thumbnail: thumbnail,
  });
  if (url && thumbnail)
    next_stage({
      channel_id: input.channel_id,
      url: url,
      thumbnail: thumbnail,
    });
}

// PARSER CODE

return {
  thumbnails: $("#thumbnail > yt-image > img")
    .toArray()
    .map((e) => $(e).attr("src")),
};
