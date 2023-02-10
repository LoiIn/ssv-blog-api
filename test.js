const content = `<p><h>kakakaka</h></p><p><img src=\"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//elK9irH//2Q==\"></p><p><h>kakakaka</h></p><p><img src=\"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//elK9irH//2Q==\"></p>`;

const regex1 = /<img[^>]+>/g;
const regex2 = /data[^>]+">/i;
const tagStrs = [...content.matchAll(regex1)];

let hehe = content;

tagStrs.forEach((tag) => {
  newSrc = tag[0].replace(tag[0].match(regex2), `hehe">`);
  hehe = hehe.replace(tag[0], newSrc);
});

console.log(hehe);
