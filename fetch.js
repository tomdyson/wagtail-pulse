import { listenAndServe } from "https://deno.land/std/http/server.ts";
import { cheerio } from "https://deno.land/x/cheerio@1.0.4/mod.ts";

function justNumber(node) {
  const number = node.text().trim().match(/[0-9]+/)[0];
  return parseInt(number);
}

async function handleRequest(request) {
  const resp = await fetch("https://github.com/wagtail/wagtail/pulse/monthly");
  const contribResp = await fetch(
    "https://github.com/wagtail/wagtail/pulse_diffstat_summary?period=monthly",
  );
  const APIResp = await fetch(
    "https://api.github.com/repos/wagtail/wagtail",
  );
  if (resp.ok && contribResp.ok && APIResp.ok) {
    const html = await resp.text();
    const contribHTML = await contribResp.text();
    const APIJSON = await APIResp.json();
    const $ = cheerio.load(html);
    const $c = cheerio.load(contribHTML);
    const newIssues = justNumber($('a[href="#new-issues"]'));
    const closedIssues = justNumber($('a[href="#closed-issues"]'));
    const openPRs = justNumber($('a[href="#open-pull-requests"]'));
    const mergedPRs = justNumber($('a[href="#merged-pull-requests"]'));
    const totalOpenPRs = justNumber(
      $("span[data-content='Pull requests']").next(),
    );
    const totalIssues = justNumber($("span[data-content='Issues']").next());
    const contributors = justNumber(
      $c(".color-fg-default").first(),
    );
    const starcount = APIJSON["stargazers_count"];
    return new Response(
      JSON.stringify({
        new_issues_last_month: newIssues,
        closed_issues_last_month: closedIssues,
        opened_pull_requests_last_month: openPRs,
        merged_pull_requests_last_month: mergedPRs,
        contributors_last_month: contributors,
        total_pull_requests: totalOpenPRs,
        total_issues: totalIssues,
        total_starcount: starcount,
      }),
      {
        headers: {
          "content-type": "application/json; charset=UTF-8",
        },
      },
    );
  }

  return new Response(
    JSON.stringify({ message: "couldn't process your request" }),
    { status: 200 },
  );
}

console.log("Listening on http://localhost:8080");

await listenAndServe(":8080", handleRequest);
