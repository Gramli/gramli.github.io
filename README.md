# Daniel Balcarek — Technical Blog

Source code for my personal technical blog and project portfolio:

**[gramli.github.io](https://gramli.github.io)**

The site contains practical articles about .NET, Angular, software
architecture, performance benchmarks, AI tooling, and experimental projects.

## Main Topics

- ASP.NET Core and C#
- Angular, TypeScript, and JavaScript
- Software architecture
- Performance benchmarks
- Databases and DevOps
- Local AI and developer tooling
- Experiments and games

## Built With

- GitHub Pages
- Jekyll
- Liquid templates
- Markdown
- HTML and CSS

## Project Structure

```text
_includes/     Homepage article lists
_layouts/      Shared page layouts
posts/         Markdown articles grouped by topic
styles/        Site and syntax-highlighting styles
assets/        Images, icons, and JavaScript
index.html     Homepage
_config.yml    Jekyll configuration
```

## Adding an Article

1. Create a Markdown file in the appropriate `posts/` directory.
2. Add its front matter:

   ```yaml
   ---
   layout: post
   title: "Article title"
   date: 2026-06-27
   categories: [experiments, typescript]
   description: "Short description used for SEO and related articles."
   canonical_url: "https://dev.to/gramli/original-article"
   ---
   ```

3. Add the article to the corresponding file in `_includes/`.
4. Verify that its generated URL follows `/posts/<directory>/<filename>`.

> [!IMPORTANT]
> DEV Community Liquid tags such as `{% embed URL %}` are not supported by
> GitHub Pages. Replace them with standard Markdown links or compatible HTML.

## Deployment

GitHub Pages builds and deploys the site from the configured publishing
branch. The Jekyll configuration is defined in `_config.yml`.

## License

Unless stated otherwise, the articles and site source remain the property of
Daniel Balcarek. Linked project repositories may use their own licenses.
