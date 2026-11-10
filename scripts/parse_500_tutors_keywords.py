#!/usr/bin/env python3
import json
import zlib
import re
import os

def parse_runs(decomp):
    runs = []
    idx = 0
    n = len(decomp)
    while idx < n:
        if decomp[idx:idx+1] == b'[':
            end_bracket = decomp.find(b']', idx)
            if end_bracket != -1:
                after = decomp[end_bracket+1:end_bracket+10].strip()
                if after.startswith(b'TJ'):
                    tj_data = decomp[idx+1:end_bracket]
                    parts = []
                    p_idx = 0
                    p_n = len(tj_data)
                    while p_idx < p_n:
                        if tj_data[p_idx:p_idx+1] == b'(':
                            p_idx += 1
                            s_bytes = bytearray()
                            esc = False
                            while p_idx < p_n:
                                b = tj_data[p_idx]
                                if esc:
                                    s_bytes.append(b)
                                    esc = False
                                elif b == 92:
                                    esc = True
                                elif b == 41:
                                    break
                                else:
                                    s_bytes.append(b)
                                p_idx += 1
                            parts.append(s_bytes.decode('latin1', errors='ignore'))
                        p_idx += 1
                    runs.append(''.join(parts))
                    idx = end_bracket + 2
                    continue
        elif decomp[idx:idx+1] == b'(':
            start = idx + 1
            s_bytes = bytearray()
            esc = False
            p_idx = start
            while p_idx < n:
                b = decomp[p_idx]
                if esc:
                    s_bytes.append(b)
                    esc = False
                elif b == 92:
                    esc = True
                elif b == 41:
                    break
                else:
                    s_bytes.append(b)
                p_idx += 1
            after = decomp[p_idx+1:p_idx+10].strip()
            if after.startswith(b'Tj'):
                runs.append(s_bytes.decode('latin1', errors='ignore'))
                idx = p_idx + 3
                continue
        idx += 1
    return runs

def extract_col_runs(matches, data, start_idx, end_idx):
    runs_all = []
    for i in range(start_idx, end_idx):
        length = int(matches[i].group(1))
        stream_bytes = data[matches[i].end() : matches[i].end() + length]
        decomp = zlib.decompress(stream_bytes)
        runs = parse_runs(decomp)
        runs_all.extend(runs)
    return runs_all

def main():
    pdf_path = 'public/assets/aistudio/Global_500_Tutors_Searchable_Keywords.._8eb058a3.pdf'
    if not os.path.exists(pdf_path):
        print(f"File {pdf_path} does not exist!")
        return

    with open(pdf_path, 'rb') as f:
        data = f.read()

    pattern = re.compile(rb'<<[^\r\n>]*?/Length\s+(\d+)[^\r\n>]*?>>\s*stream\r?\n', re.DOTALL)
    matches = list(pattern.finditer(data))
    print(f"Total stream matches: {len(matches)}")

    r1 = extract_col_runs(matches, data, 0, 17)    # ID, Tutor Name, Tutor Tier, Country
    r2 = extract_col_runs(matches, data, 17, 34)   # Location / City, Rating, Reviews Count, Hourly Rate ($/hr)
    r3 = extract_col_runs(matches, data, 34, 51)   # Primary Subject (Direct Name), Subject Expertise (Tailored)
    r4 = extract_col_runs(matches, data, 51, 68)   # Searchable Keywords
    r5 = extract_col_runs(matches, data, 68, 85)   # Education Credentials
    r6 = extract_col_runs(matches, data, 85, 102)  # Experience Summary, Availability
    r7 = extract_col_runs(matches, data, 102, 119) # Can Meet, Hobbies / Interests
    r8 = extract_col_runs(matches, data, 119, 136) # Verification Status

    # Curated portrait avatars from Unsplash
    portrait_avatars = [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256",
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256",
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256",
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256",
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=256",
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=256",
        "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=256",
        "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=256",
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256",
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=256",
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=256",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=256",
        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=256"
    ]

    country_map = {
        'USA': 'United States',
        'UK': 'United Kingdom',
        'Australia': 'Australia',
        'Canada': 'Canada',
        'Singapore': 'Singapore',
        'Ireland': 'Ireland',
        'New Zealand': 'New Zealand',
        'UAE': 'United Arab Emirates'
    }

    tutors = []
    seen_composite_keys = set()
    duplicates_detected = 0

    for i in range(500):
        # Table 1: 4 columns (skip 4 header)
        num_id = int(r1[4 + i * 4])
        name = r1[4 + i * 4 + 1].strip()
        tutor_tier = r1[4 + i * 4 + 2].strip()
        country_code = r1[4 + i * 4 + 3].strip()
        country_full = country_map.get(country_code, country_code)

        # Table 2: 4 columns (skip 4 header)
        city_location = r2[4 + i * 4].strip()
        rating = float(r2[4 + i * 4 + 1])
        reviews_count = int(r2[4 + i * 4 + 2])
        rate_str = r2[4 + i * 4 + 3].replace('$', '').strip()
        hourly_rate = float(rate_str)

        # Table 3: 2 columns (skip 2 header)
        primary_subject = r3[2 + i * 2].strip()
        raw_expertise = r3[2 + i * 2 + 1].strip()
        expertise_list = [s.strip() for s in raw_expertise.split(',') if s.strip()]
        if primary_subject and primary_subject not in expertise_list:
            expertise_list.insert(0, primary_subject)

        # Table 4: 1 column (skip 1 header)
        searchable_keywords = r4[1 + i].strip()

        # Table 5: 1 column (skip 1 header)
        education = r5[1 + i].strip()

        # Table 6: 2 columns (skip 2 header)
        experience = r6[2 + i * 2].strip()
        availability = r6[2 + i * 2 + 1].strip()

        # Table 7: 2 columns (skip 2 header)
        can_meet = r7[2 + i * 2].strip()
        hobbies = r7[2 + i * 2 + 1].strip()

        # Table 8: 1 column (skip 1 header)
        verification_status = r8[1 + i].strip()

        # Deduplication composite check: (name, primary_subject, city_location)
        comp_key = (name.lower(), primary_subject.lower(), city_location.lower())
        if comp_key in seen_composite_keys:
            duplicates_detected += 1
            print(f"Skipping duplicate tutor: {name} ({primary_subject}, {city_location})")
            continue
        seen_composite_keys.add(comp_key)

        avatar = portrait_avatars[(num_id - 1) % len(portrait_avatars)]
        tutor_id_str = f"tutor_global_{num_id:03d}"

        record = {
            "id": tutor_id_str,
            "numericId": num_id,
            "name": name,
            "email": f"tutor.{num_id:03d}@university-tutors.com",
            "role": "tutor",
            "tutorTier": tutor_tier,
            "isMasterTutor": "Master Tutor" in tutor_tier,
            "country": country_code,
            "countryFull": country_full,
            "location": city_location,
            "cityLocation": city_location,
            "rating": rating,
            "reviewsCount": reviews_count,
            "hourlyRate": hourly_rate,
            "primarySubject": primary_subject,
            "subjectExpertise": expertise_list,
            "searchableKeywords": searchable_keywords,
            "education": education,
            "experience": experience,
            "experienceSummary": experience,
            "availability": availability,
            "canMeet": can_meet,
            "hobbies": hobbies,
            "verificationStatus": verification_status,
            "isVerified": "Verified" in verification_status,
            "avatarUrl": avatar,
            "headline": f"{tutor_tier} • {primary_subject} Specialist",
            "bio": f"{experience} Academic qualifications: {education}. Available for {availability.lower()}."
        }
        tutors.append(record)

    print(f"Parsed {len(tutors)} unique tutors from PDF. Zero duplicates: {duplicates_detected == 0}")

    # 1. Save public/tutors_500.json
    with open('public/tutors_500.json', 'w', encoding='utf-8') as f:
        json.dump(tutors, f, indent=2)
    print("Saved public/tutors_500.json")

    with open('public/tutors_200.json', 'w', encoding='utf-8') as f:
        json.dump(tutors, f, indent=2)
    print("Saved public/tutors_200.json")

    # 2. Generate TypeScript file src/data/trendingTutors500Data.ts
    ts_code = """// Master dataset of 500 Verified International Tutors with Searchable Keywords
// Directly extracted from Global_500_Tutors_Searchable_Keywords.._8eb058a3.pdf
// Guaranteed ZERO duplicate profiles across all subjects and locations.

export interface TrendingTutor {
  id: string;
  numericId: number;
  name: string;
  email: string;
  role: 'tutor';
  tutorTier: string;
  isMasterTutor: boolean;
  country: string;
  countryFull: string;
  location: string;
  cityLocation?: string;
  rating: number;
  reviewsCount: number;
  hourlyRate: number;
  primarySubject: string;
  education: string;
  experience: string;
  experienceSummary?: string;
  subjectExpertise: string[];
  searchableKeywords: string;
  availability: string;
  canMeet: string;
  hobbies: string;
  verificationStatus: string;
  isVerified: boolean;
  avatarUrl: string;
  headline: string;
  bio: string;
}

export const TRENDING_TUTORS_500: TrendingTutor[] = """ + json.dumps(tutors, indent=2) + """;

// Backwards-compatible alias for previous imports
export const TRENDING_TUTORS_200: TrendingTutor[] = TRENDING_TUTORS_500;
"""
    with open('src/data/trendingTutors500Data.ts', 'w', encoding='utf-8') as f:
        f.write(ts_code)
    print("Saved src/data/trendingTutors500Data.ts")

if __name__ == '__main__':
    main()
