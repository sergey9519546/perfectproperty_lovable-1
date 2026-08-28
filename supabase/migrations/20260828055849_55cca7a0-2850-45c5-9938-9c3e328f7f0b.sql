
CREATE TABLE IF NOT EXISTS public.distress_sources (
  key text PRIMARY KEY,
  label text NOT NULL,
  category text NOT NULL,
  tier text NOT NULL DEFAULT 'national',
  url text NOT NULL,
  spider text,
  notes text,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.distress_sources TO authenticated;
GRANT ALL ON public.distress_sources TO service_role;
ALTER TABLE public.distress_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view distress sources"
  ON public.distress_sources FOR SELECT TO authenticated USING (true);

INSERT INTO public.distress_sources (key, label, category, tier, url, spider, notes) VALUES
  ('sheriff_sale','County sheriff sale','court','county','https://www.google.com/search?q=sheriff+sale+listings','county_sheriff_sale','Court-ordered foreclosure auctions published by the county sheriff.'),
  ('trustee_sale','Trustee / deed-of-trust sale','court','county','https://www.google.com/search?q=trustee+sale+notice','county_trustee_sale','Non-judicial foreclosure auctions run by a trustee.'),
  ('hud','HUD Home Store','government','national','https://www.hudhomestore.gov/','gov_reo','FHA-insured homes taken back by HUD.'),
  ('fannie_mae','Fannie Mae HomePath','government','national','https://www.homepath.com/','gov_reo','Foreclosed homes owned by Fannie Mae.'),
  ('freddie_mac','Freddie Mac HomeSteps','government','national','https://www.homesteps.com/','gov_reo','Foreclosed homes owned by Freddie Mac.'),
  ('usda','USDA Rural Development','government','national','https://properties.sc.egov.usda.gov/','gov_reo','Rural single-family and farm properties for sale by USDA.'),
  ('va','VA acquired properties','government','national','https://www.vrmproperties.com/','gov_reo','Homes acquired through VA-guaranteed loans.'),
  ('irs','IRS seized property auctions','government','national','https://www.irsauctions.gov/','gov_reo','Real property seized for unpaid federal tax.'),
  ('treasury','Treasury forfeiture auctions','government','national','https://www.cwsmarketing.com/','gov_reo','Real estate forfeited to the US Treasury.'),
  ('marshals','US Marshals asset sales','government','national','https://www.usmarshals.gov/what-we-do/asset-forfeiture/','gov_reo','Real estate forfeited in federal criminal cases.'),
  ('gsa','GSA surplus real property','government','national','https://realestatesales.gov/','gov_reo','Federal surplus land and buildings.')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.scrape_target_templates
  (source_kind, spider, url_template, applies_to_states, needs_zyte, cadence_hours, priority_boost, notes)
VALUES
  ('foreclosure','county_sheriff_sale','sheriff://sales/{fips}', NULL, true, 24, 0.4, 'County sheriff sale calendar'),
  ('foreclosure','county_trustee_sale','trustee://sales/{fips}', NULL, true, 24, 0.35, 'Trustee / deed-of-trust sale notices'),
  ('listing','gov_reo','gov://hud/{fips}', NULL, true, 24, 0.3, 'HUD Home Store REO'),
  ('listing','gov_reo','gov://fannie_mae/{fips}', NULL, true, 24, 0.3, 'Fannie Mae HomePath REO'),
  ('listing','gov_reo','gov://freddie_mac/{fips}', NULL, true, 24, 0.3, 'Freddie Mac HomeSteps REO'),
  ('listing','gov_reo','gov://usda/{fips}', NULL, true, 48, 0.2, 'USDA Rural Development sales'),
  ('listing','gov_reo','gov://va/{fips}', NULL, true, 48, 0.2, 'VA acquired properties')
ON CONFLICT DO NOTHING;
